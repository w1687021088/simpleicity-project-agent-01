import base64
import hashlib

import bcrypt


def _prehash(password: str) -> bytes:
    """
    bcrypt 有 72 字节上限。
    先 SHA-256 再 Base64，得到固定 44 字节，避免超长密码被截断。
    """
    digest = hashlib.sha256(password.encode("utf-8")).digest()
    return base64.b64encode(digest)


def hash_password(password: str) -> str:
    """对明文密码进行哈希"""
    return bcrypt.hashpw(_prehash(password), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证明文密码是否与哈希匹配"""
    try:
        return bcrypt.checkpw(
            _prehash(plain_password),
            hashed_password.encode("utf-8"),
        )
    except (ValueError, TypeError):
        return False
