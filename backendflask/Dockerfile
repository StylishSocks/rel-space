FROM conda/miniconda3

# Create a conda environment with Python 3.8
RUN conda create -n cad python=3.8 pip -y

# Install necessary packages into the environment without needing `activate`
RUN conda install -n cad -c conda-forge pythonocc-core flask flask-cors trimesh -y && \
    conda clean -afy

# Set environment path so that executables from the `cad` env are found
ENV PATH /opt/conda/envs/cad/bin:$PATH
ENV CONDA_DEFAULT_ENV=cad

# Set working directory
WORKDIR /app

# Copy project files into the container
COPY . /app

# Expose the port used by Flask
EXPOSE 5000

# Set the default environment for Flask (using FLASK_DEBUG instead of FLASK_ENV)
ENV FLASK_APP=flaskapp.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_DEBUG=1  

# Set to '1' for debug mode

# Command to run Flask, ensuring the environment is activated
CMD ["bash", "-c", "source activate cad && python flaskapp.py"]
