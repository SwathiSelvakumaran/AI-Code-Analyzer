FROM python:3.12-slim

RUN pip install pipenv

WORKDIR /app

# RUN pipenv install torch torchvision torchaudio --channel pytorch cpuonly

RUN pip3 install torch==2.3.0+cpu torchvision torchaudio -f https://download.pytorch.org/whl/torch_stable.html

COPY ["Pipfile", "Pipfile.lock", "./"]

RUN pipenv install --deploy --system --dev



COPY ["model.pt", "multilabelbinarizer.pt", "server.py" , "transformer.py", "utils.py", "./" ]

EXPOSE 9696

ENTRYPOINT ["gunicorn", "--bind=0.0.0.0:9696", "server:app"]