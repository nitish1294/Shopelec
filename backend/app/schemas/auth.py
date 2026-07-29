from pydantic import BaseModel, EmailStr


class SignupIn(BaseModel):
    name: str
    email: EmailStr
    phone: str = ""
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: str = ""
    role: str = "customer"


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
