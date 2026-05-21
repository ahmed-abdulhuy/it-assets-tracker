from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# =====================================================
# Employee Schemas
# =====================================================

class EmployeeBase(BaseModel):
    first_name: str
    last_name: str
    email: Optional[EmailStr] = None
    job_title: Optional[str] = None
    is_active: bool = True


class EmployeeCreate(EmployeeBase):
    """Used when creating a new employee (POST)."""
    pass

class EmployeeUpdate(BaseModel):
    """Used when updating an employee (PATCH). All fields optional."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    job_title: Optional[str] = None
    is_active: Optional[bool] = None


class EmployeeOut(EmployeeBase):
    """Returned in API responses."""
    employee_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# =====================================================
# Computer Schemas
# =====================================================

class ComputerBase(BaseModel):
    device_type: str
    model: Optional[str] = None
    specs: Optional[str] = None
    status: str = "available"


class ComputerCreate(ComputerBase):
    """Used when registering a new computer (POST)."""
    pass


class ComputerUpdate(BaseModel):
    """Used when updating a computer (PATCH). All fields optional."""
    device_type: Optional[str] = None
    model: Optional[str] = None
    specs: Optional[str] = None
    status: Optional[str] = None


class ComputerOut(ComputerBase):
    """Returned in API responses."""
    computer_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# =====================================================
# Assignment Schemas
# =====================================================

class AssignmentBase(BaseModel):
    computer_id: int
    employee_id: int
    assigned_by: Optional[str] = None


class AssignmentCreate(AssignmentBase):
    """Used when assigning a computer to an employee (POST)."""
    pass


class AssignmentReturn(BaseModel):
    """Used when marking a computer as returned (PATCH)."""
    returned_at: Optional[datetime] = None  # Defaults to now if not provided


class AssignmentOut(AssignmentBase):
    """Returned in API responses."""
    assignment_id: int
    assigned_at: datetime
    returned_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AssignmentOutDetailed(AssignmentOut):
    """Extended response that includes nested employee and computer info."""
    employee: EmployeeOut
    computer: ComputerOut

    class Config:
        from_attributes = True