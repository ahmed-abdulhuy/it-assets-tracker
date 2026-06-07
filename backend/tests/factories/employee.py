

from app.models import Employee


def create_employee(
    session,
    name="Ahmed"
):
    employee = Employee(
        name=name
    )

    session.add(employee)
    session.commit()
    session.refresh(employee)

    return employee