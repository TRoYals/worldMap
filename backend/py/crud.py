from sqlalchemy.orm import Session
from sqlalchemy import asc, desc
from . import models, schemas


def create_new_city(db: Session, city_item: schemas.CityCreate):
    db_city_item = models.Cities(**city_item.dict())
    db.add(db_city_item)
    db.commit()
    db.refresh(db_city_item)
    return db_city_item


def get_city_item(db: Session, search_criteria: schemas.CitySearch):
    query = db.query(models.Cities)

    if search_criteria.code is not None:
        query = query.filter(models.Cities.code == search_criteria.code)

    if search_criteria.country_name is not None:
        query = query.filter(models.Cities.country_name == search_criteria.country_name)

    if search_criteria.capital_name is not None:
        query = query.filter(models.Cities.capital_name == search_criteria.capital_name)

    return query.all()


def get_all_cities_item(db: Session):
    return db.query(models.Cities).order_by(asc(models.Cities.code)).all()


def get_city_by_code(db: Session, code: int):
    return db.query(models.Cities).filter(models.Cities.code == code).first()
