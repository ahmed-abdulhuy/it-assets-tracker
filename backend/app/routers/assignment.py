from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app import schemas
from app.crud import assignment as crud_assignment
from app.database import get_db

router = APIRouter(prefix="/assignments", tags=["Assignments"])


@router.post("/", response_model=schemas.AssignmentOut, status_code=status.HTTP_201_CREATED)
def assign_computer(assignment: schemas.AssignmentCreate, db: Session = Depends(get_db)):
    return crud_assignment.assign_computer(db, assignment)


@router.patch("/{assignment_id}/return", response_model=schemas.AssignmentOut)
def return_computer(
    assignment_id: int,
    payload: schemas.AssignmentReturn,
    db: Session = Depends(get_db)
):
    return crud_assignment.return_computer(db, assignment_id, payload.returned_at)