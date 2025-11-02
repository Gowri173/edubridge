# Use an official Python image
FROM python:3.10

# Set the working directory inside the container
WORKDIR /app

# Copy dependency file & install all dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all backend code into container
COPY . .

# Expose FastAPI's default port
EXPOSE 8000

# Start the FastAPI app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
