# Prairie
Prairie Lawn Care (backend)


## Project setup

### Installing

It's recommended to run the project on Unix systems. If working on Windows, try using Bash for Ubuntu for Windows.

1. Install global dependencies

    - python3.5
    - postgres 9.3


2. Clone repository

Clone repo to local folder.

    $ mkdir prairie_lawn_care
    $ cd prairie_lawn_care/  
    $ git clone https://github.com/Prairie-Dev/Prairie_Back.git

3. Install dependencies

Install Python dependencies

    pip install -r config/requirements.pip  # for Python
    cd source
 

4. Set up database

Our project settings for local development are hardcoded as of now to use a database called `prairie_lawn_care` with user `postgres` and password `postgres`. Create database that matches those params. Then:

    python manage.py makemigrations            # create database structure from migrations
    python manage.py migrate                   # create database in postgres
   


5. Run local development server

For continuous development, keep two terminals open:

    python manage.py runserver          # in one terminal, will start server in port 8000
    

astroid==1.6.1
certifi==2018.1.18
chardet==3.0.4
click==6.7
coreapi==2.3.3
coreschema==0.0.4
defusedxml==0.5.0
Django==2.0.2
django-cors-headers==2.1.0
django-cors-middleware==1.3.1
django-filter==1.1.0
django-oauth-toolkit==1.0.0
django-rest-swagger==2.1.2
djangorestframework==3.7.7
gunicorn==19.7.1
idna==2.6
isort==4.3.4
itypes==1.1.0
Jinja2==2.10
lazy-object-proxy==1.3.1
MarkupSafe==1.0
mccabe==0.6.1
numpy==1.14.2
oauthlib==2.0.6
openapi-codec==1.3.2
Pillow==5.0.0
psycopg2==2.7.4
psycopg2-binary==2.7.4
PyJWT==1.6.1
python3-openid==3.1.0
pytz==2018.3
requests==2.18.4
requests-oauthlib==0.8.0
simplejson==3.13.2
six==1.11.0
social-auth-core==1.7.0
stripe==1.80.0
uritemplate==3.0.0
urllib3==1.22
wrapt==1.10.11
xmltodict==0.11.0
>