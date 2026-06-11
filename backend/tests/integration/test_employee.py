def test_add_employee(client):
    response = client.post("/employees/", json={
        "first_name": "Test",
        "last_name": "Employee",
        "email": "test.employee@example.com",
        "job_title": "Tester"
    })
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["first_name"] == "Test"
    assert data["last_name"] == "Employee"
    assert data["email"] == "test.employee@example.com"
    assert data["job_title"] == "Tester"
    assert "employee_id" in data
    assert "created_at" in data
    

def test_get_employees(client):
    client.post("/employees/", json={
        "first_name": "Test",
        "last_name": "Employee",
        "email": "test.employee@example.com",
        "job_title": "Tester"
    })
    response = client.get("/employees/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    for employee in data:
        assert "employee_id" in employee
        assert "first_name" in employee
        assert "last_name" in employee
        assert "email" in employee
        assert "job_title" in employee
        assert "is_active" in employee
        assert "created_at" in employee


def test_get_employee_by_id(client):
    post_response = client.post("/employees/", json={
        "first_name": "Test",
        "last_name": "Employee",
        "email": "test.employee@example.com",
        "job_title": "Tester"
    })
    assert post_response.status_code == 201
    employee_id = post_response.json()["employee_id"]

    response = client.get(f"/employees/{employee_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["employee_id"] == employee_id
    assert data["first_name"] == "Test"
    assert data["last_name"] == "Employee"
    assert data["email"] == "test.employee@example.com"
    assert data["job_title"] == "Tester"

def test_get_employee_by_id_not_found(client):
    response = client.get("/employees/99999")
    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Employee not found"


def test_get_employee_by_email(client):
    post_response = client.post("/employees/", json={
        "first_name": "Test",
        "last_name": "Employee",
        "email": "test.employee@example.com",
        "job_title": "Tester",
    })
    assert post_response.status_code == 201
    response = client.get("/employees/email/test.employee@example.com")
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test.employee@example.com"
    assert data["first_name"] == "Test"
    assert data["last_name"] == "Employee"
    assert data["job_title"] == "Tester"


def test_get_employee_by_email_not_found(client):
    response = client.get("/employees/email/nonexistent@example.com")
    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Employee not found"


def test_update_employee(client):
    # First, Add an employee to ensure there's something to update
    post_response = client.post("/employees/", json={
        "first_name": "Test",
        "last_name": "Employee",
        "email": "test.employee@example.com",
        "job_title": "Tester"
    })
    assert post_response.status_code == 201
    employee_id = post_response.json()["employee_id"]

    # Now, update the employee
    response = client.patch(f"/employees/{employee_id}", json={
        "first_name": "Updated",
        "last_name": "Employee",
        "email": "updated.employee@example.com",
        "job_title": "Senior Tester"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["employee_id"] == employee_id
    assert data["first_name"] == "Updated"
    assert data["last_name"] == "Employee"
    assert data["email"] == "updated.employee@example.com"
    assert data["job_title"] == "Senior Tester"


def test_update_employee_not_found(client):
    response = client.patch("/employees/99999", json={
        "first_name": "Updated",
        "last_name": "Employee",
        "email": "updated.employee@example.com",
        "job_title": "Senior Tester"
    })
    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Employee not found"


def test_delete_employee(client):
    # First, Add an employee to ensure there's something to delete
    post_response = client.post("/employees/", json={
        "first_name": "Test",
        "last_name": "Employee",
        "email": "test.employee@example.com",
        "job_title": "Tester"
    })
    assert post_response.status_code == 201
    employee_id = post_response.json()["employee_id"]

    # Now, delete the employee
    response = client.delete(f"/employees/{employee_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["is_active"] == False
    assert data["employee_id"] == employee_id
    assert data["first_name"] == "Test"
    assert data["last_name"] == "Employee"
    assert data["email"] == "test.employee@example.com"


def test_delete_employee_not_found(client):
    response = client.delete("/employees/99999")
    assert response.status_code == 404
    data = response.json()
    assert data["detail"] == "Employee not found"


def test_get_employee_history(client):
    # First, add a device to ensure there's at least one device in the database
    device_post_response = client.post("/devices", json={
        "device_type": "Test_Laptop",
        "model": "Test Model",
        "specs": "Intel Core i7, 16GB RAM, 512GB SSD",
        "status": "available"
    })
    
    assert device_post_response.status_code == 201
    created_device = device_post_response.json()
    device_id = created_device["device_id"]


    # Second, add an employee to ensure there's at least one employee in the database
    employee_post_response = client.post("/employees", json={
        "first_name": "Test_Employee_First",
        "last_name": "Test_Employee_Last",
        "email": "test.employee@example.com",
        "job_title": "Tester",
        "is_active": True
    })

    assert employee_post_response.status_code == 201
    created_employee = employee_post_response.json()
    employee_id = created_employee["employee_id"]

    # Third, create an assignment to ensure there's at least one assignment in the database
    assignment_post_response = client.post("/assignments", json={
        "device_id": device_id,
        "employee_id": employee_id,
        "assigned_by": "Test User"
    })

    assert assignment_post_response.status_code == 201
    created_assignment = assignment_post_response.json()

    # Now, get the employee history
    response = client.get(f"/employees/{employee_id}/history")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    for entry in data:
        assert "assignment_id" in entry
        assert "device" in entry
        assert entry["device"]["device_id"] == device_id
        assert "assigned_at" in entry