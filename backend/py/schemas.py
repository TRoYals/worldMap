from pydantic import BaseModel, Field, root_validator


class CityBase(BaseModel):
    x_pos: float
    y_pos: float
    capital_name: str
    country_name: str
    code: int
    comments: str | None = None

    class Config:
        orm_mode = True


class CityCreate(CityBase):
    code: int = Field(..., alias="countryCode")
    capital_name: str = Field(..., alias="capitalName")
    country_name: str = Field(..., alias="countryName")
    comments: str | None = Field(..., alias="comments")


class CityEdit(CityBase):
    pass


class CitySearch(BaseModel):
    code: int | None = Field(default=None)
    country_name: str | None = Field(default=None)
    capital_name: str | None = Field(default=None)

    @root_validator(pre=True)
    def check_at_least_one_field(cls, values):
        code = values.get("code")
        country_name = values.get("country_name")
        capital_name = values.get("capital_name")
        if not (code or country_name or capital_name):
            raise ValueError(
                "At least one of code, country_name, or capital_name must be provided"
            )
        return values
