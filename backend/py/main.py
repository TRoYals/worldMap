from typing import Union

from fastapi import FastAPI, Depends
from pydantic import BaseModel
from .database import engine, get_db
from . import crud, models, schemas
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException


app = FastAPI()

origins = [
    "http://localhost:3000",  # 你的前端应用地址
    "http://localhost:8000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",  # 你的前端应用地址
    "http://localhost:8001",
    "http://127.0.0.1:3001",
    "https://startling-souffle-4fcae8.netlify.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/cities/", response_model=list[schemas.CityBase])
def get_all_cities_item(db: Session = Depends(get_db)):
    items = crud.get_all_cities_item(db=db)
    return items


@app.post("/cities/", response_model=list[schemas.CityBase])
def handle_city_request(city: schemas.CityCreate, db: Session = Depends(get_db)):
    db_city = crud.get_city_by_code(db, code=city.code)
    if db_city:
        # 如果记录存在，检查数据是否有更新
        updated = False
        if (
            db_city.x_pos != city.x_pos
            or db_city.y_pos != city.y_pos
            or db_city.capital_name != city.capital_name
            or db_city.country_name != city.country_name
            or db_city.comments != city.comments
        ):
            updated = True
            db_city.x_pos = city.x_pos
            db_city.y_pos = city.y_pos
            db_city.capital_name = city.capital_name
            db_city.country_name = city.country_name
            db_city.comments = city.comments
            db.add(db_city)
            db.commit()
            db.refresh(db_city)
        if updated:
            # 返回全部数据
            return crud.get_all_cities_item(db=db)
        else:
            raise HTTPException(status_code=200, detail="No changes detected")
    else:
        # 如果记录不存在，创建新记录
        new_city = models.Cities(
            code=city.code,
            x_pos=city.x_pos,
            y_pos=city.y_pos,
            capital_name=city.capital_name,
            country_name=city.country_name,
            comments=city.comments,
        )
        db.add(new_city)
        db.commit()
        db.refresh(new_city)
        # 返回全部数据
        return crud.get_all_cities_item(db=db)
