FROM postgres:latest

ENV POSTGRES_USER=your_db_user
ENV POSTGRES_PASSWORD=your_db_password
ENV POSTGRES_DB=your_db_name

EXPOSE 5432
