from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class Cities(Base):
    __tablename__ = "Cities"

    code = Column(Integer, primary_key=True)
    x_pos = Column(Float)
    y_pos = Column(Float)
    capital_name = Column(String(20))
    country_name = Column(String(20))
    comments = Column(String(300))
