import json
from typing import Any, Optional

from redis.asyncio import Redis, ConnectionPool

from src.libs.logger import logger
from settings import app_settings


def _build_redis_url() -> str:
    """根据配置构建 Redis 连接 URL"""
    host = app_settings.ADMIN_REDIS_HOST
    port = app_settings.ADMIN_REDIS_PORT
    db = app_settings.ADMIN_REDIS_DB
    password = app_settings.ADMIN_REDIS_PASSWORD

    if password:
        return f"redis://:{password}@{host}:{port}/{db}"
    return f"redis://{host}:{port}/{db}"


class RedisManager:
    """Redis 管理器：连接管理 + 常用操作封装"""

    def __init__(self):
        self.pool: Optional[ConnectionPool] = None
        self.client: Optional[Redis] = None

    # ==================== 连接管理 ====================

    async def connect(self):
        """初始化连接池"""
        url = _build_redis_url()
        max_conn = app_settings.ADMIN_REDIS_MAX_CONNECTIONS

        self.pool = ConnectionPool.from_url(
            url,
            max_connections=max_conn,
            decode_responses=True,
        )
        client = Redis(connection_pool=self.pool)
        self.client = Redis(connection_pool=self.pool)
        await client.ping()
        self.client = client  # 验证通过后再赋值
        logger.info(f"✅ Redis 连接成功 (host={app_settings.ADMIN_REDIS_HOST})")

    async def disconnect(self):
        """关闭连接池"""
        if self.client:
            await self.client.aclose()
        if self.pool:
            await self.pool.aclose()
        logger.info("🛑 Redis 连接已释放")

    def get_client(self) -> Redis:
        """获取原生 Redis 客户端（用于封装没覆盖的操作）"""
        if self.client is None:
            raise RuntimeError("Redis 未初始化，请先调用 connect()")
        return self.client

    # ==================== 基础操作 ====================

    async def get(self, key: str) -> Optional[str]:
        """获取字符串值"""
        return await self.get_client().get(key)

    async def set(
            self,
            key: str,
            value: str,
            ex: Optional[int] = None,
            nx: bool = False,
    ) -> bool:
        """
        设置字符串值

        :param ex: 过期秒数
        :param nx: True 时，只有 key 不存在才设置（用于分布式锁、防重复）
        """
        return await self.get_client().set(key, value, ex=ex, nx=nx)

    async def delete(self, *keys: str) -> int:
        """删除一个或多个 key，返回删除数量"""
        if not keys:
            return 0
        return await self.get_client().delete(*keys)

    async def exists(self, key: str) -> bool:
        """判断 key 是否存在"""
        return bool(await self.get_client().exists(key))

    async def expire(self, key: str, seconds: int) -> bool:
        """设置 key 过期时间（秒）"""
        return await self.get_client().expire(key, seconds)

    async def ttl(self, key: str) -> int:
        """
        获取 key 剩余有效期（秒）

        返回：
          -1：key 存在但无过期时间
          -2：key 不存在
          其它：剩余秒数
        """
        return await self.get_client().ttl(key)

    # ==================== 计数 ====================

    async def incr(self, key: str, amount: int = 1) -> int:
        """自增，返回自增后的值"""
        return await self.get_client().incrby(key, amount)

    async def decr(self, key: str, amount: int = 1) -> int:
        """自减，返回自减后的值"""
        return await self.get_client().decrby(key, amount)

    # ==================== JSON 自动序列化 ====================

    async def get_json(self, key: str) -> Optional[Any]:
        """读取并反序列化 JSON 值"""
        raw = await self.get_client().get(key)
        if raw is None:
            return None
        try:
            return json.loads(raw)
        except (json.JSONDecodeError, TypeError):
            return None

    async def set_json(self, key: str, value: Any, ex: Optional[int] = None) -> bool:
        """序列化为 JSON 后存储"""
        return await self.get_client().set(
            key,
            json.dumps(value, ensure_ascii=False, default=str),
            ex=ex,
        )

    # ==================== Hash ====================

    async def hset(self, name: str, key: str, value: Any) -> int:
        """设置 hash 字段"""
        if not isinstance(value, str):
            value = json.dumps(value, ensure_ascii=False, default=str)
        return await self.get_client().hset(name, key, value)

    async def hget(self, name: str, key: str) -> Optional[str]:
        """获取 hash 字段"""
        return await self.get_client().hget(name, key)

    async def hgetall(self, name: str) -> dict[str, str]:
        """获取整个 hash"""
        return await self.get_client().hgetall(name)

    async def hdel(self, name: str, *keys: str) -> int:
        """删除 hash 字段"""
        if not keys:
            return 0
        return await self.get_client().hdel(name, *keys)

    # ==================== 原子锁 ====================

    async def acquire_lock(self, key: str, token: str, ex: int = 30) -> bool:
        """
        获取分布式锁（SET NX EX）
        :param token: 唯一标识（一般是 uuid），释放时校验，避免误删别人的锁
        :param ex: 锁过期时间（秒），防止死锁
        """
        return await self.get_client().set(key, token, ex=ex, nx=True)

    async def release_lock(self, key: str, token: str) -> bool:
        """释放锁（只有 token 匹配才删，避免误删）"""
        # Lua 保证原子性
        script = """
        if redis.call('get', KEYS[1]) == ARGV[1] then
            return redis.call('del', KEYS[1])
        else
            return 0
        end
        """
        result = await self.get_client().eval(script, 1, key, token)
        return bool(result)


# 全局单例
app_redis = RedisManager()
