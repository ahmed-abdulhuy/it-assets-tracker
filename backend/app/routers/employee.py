from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app import schemas
from app.crud import employee as crud_employee
from app.crud import assignment as crud_assignment
from app.database import get_db
from typing import List

router = APIRouter(prefix="/employees", tags=["Employees"])


@router.post("/", response_model=schemas.EmployeeOut, status_code=status.HTTP_201_CREATED)
def create_employee(employee: schemas.EmployeeCreate, db: Session = Depends(get_db)):
    # Prevent duplicate emails
    if employee.email:
        existing = crud_employee.get_employee_by_email(db, employee.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"An employee with email '{employee.email}' already exists."
            )

    return crud_employee.create_employee(db, employee)


@router.get("/", response_model=list[schemas.EmployeeOut])
def get_employees(db: Session = Depends(get_db)):
    return crud_employee.get_employees(db)


@router.get("/{employee_id}", response_model=schemas.EmployeeOut)
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    db_employee = crud_employee.get_employee(db, employee_id)
    if not db_employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    return db_employee

@router.get("/email/{email}", response_model=schemas.EmployeeOut)
def get_employee_by_email(email: str, db: Session = Depends(get_db)):
    db_employee = crud_employee.get_employee_by_email(db, email)
    if not db_employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    return db_employee


@router.get("/{employee_id}/history", response_model=List[schemas.EmployeeHistoryEntry])
def get_employee_history(employee_id: int, db: Session = Depends(get_db)):
    return crud_assignment.get_employee_history(db, employee_id)


@router.patch("/{employee_id}", response_model=schemas.EmployeeOut)
def update_employee(employee_id: int, employee: schemas.EmployeeUpdate, db: Session = Depends(get_db)):
    db_employee = crud_employee.get_employee(db, employee_id)
    if not db_employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    # If email is being updated, check for duplicates
    if employee.email and employee.email != db_employee.email:
        existing = crud_employee.get_employee_by_email(db, employee.email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"An employee with email '{employee.email}' already exists."
            )

    updated_employee = crud_employee.update_employee(db, employee_id, employee)
    return updated_employee


@router.delete("/{employee_id}", response_model=schemas.EmployeeOut)
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    db_employee = crud_employee.get_employee(db, employee_id)
    if not db_employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    db_employee.is_active = False

    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)

    return db_employee