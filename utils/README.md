# Utility scripts

To run the python scripts, you need to install the required packages. You may want to consider using a virtual environment to keep your global python packages neat:

```

# Create venv folder
python3 -m venv venv
# Activate venv
source venv/bin/activate
```

Now the `python` and `pip` will run from your `venv` folder and install packages to `venv`.

Install the required packages

```
pip install -r requirements.txt
```

Then run the script using

```
python osc-send.py
```
