from sqlalchemy.orm import relationship
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime

class Employee(SQLModel, table=True):
    __tablename__ = "employees"

    employee_id: Optional[int] = Field(default=None, primary_key=True, index=True)
    first_name: str
    last_name: str
    email: Optional[str] = Field(default=None, unique=True)
    job_title: Optional[str] = None
    is_active: bool = True

    created_at: datetime | None = None
    updated_at: datetime | None = None

    # One employee can have many assignment records (history)
    assignments: list["ComputerAssignment"] = Relationship(
        back_populates="employee"
    )

class Computer(SQLModel, table=True):
    __tablename__ = "computers"

    computer_id: Optional[int] = Field(default=None, primary_key=True, index=True)

    device_type: str = Field(unique=True)
    model: Optional[str] = None
    specs: Optional[str] = None

    status: str = "available"

    created_at: datetime | None = None
    updated_at: datetime | None = None

    # One computer can have many assignment records (history)
    assignments: list["ComputerAssignment"] = Relationship(
        back_populates="computer"
    )

class ComputerAssignment(SQLModel, table=True):
    __tablename__ = "computer_assignments"

    assignment_id: Optional[int] = Field(default=None, primary_key=True, index=True)

    computer_id: int = Field(foreign_key="computers.computer_id")
    employee_id: int = Field(foreign_key="employees.employee_id")

    assigned_at: datetime | None = None
    returned_at: Optional[datetime] = None
    assigned_by: Optional[str] = None

    computer: Optional["Computer"] = Relationship(
        back_populates="assignments"
    )

    employee: Optional["Employee"] = Relationship(
        back_populates="assignments"
    )