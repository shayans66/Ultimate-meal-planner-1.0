from flask import Flask, render_template, request
import requests

app = Flask(__name__)

API_KEY = 'XUVPTddV3TNR8Bts0DR9JyY7Zftxiv7OgPa8OFsb'


@app.route('/', methods=('GET', 'POST'))
def index():
    if request.method == 'POST':
        params = {'api_key': API_KEY, 'q': request.form['food-field'], 'max': 1, 'ds': 'Standard Reference'}
        r = requests.get('https://api.nal.usda.gov/ndb/search/', params=params)
        print(r.json())
        ndbno = r.json()['list']['item'][0]['ndbno']

        params = {'api_key': API_KEY, 'ndbno': [ndbno]}
        print(params)
        r = requests.get('https://api.nal.usda.gov/ndb/V2/reports', params=params,
                         headers={'Content-Type': 'application/json'})

        return render_template('index.html', food=r.json()['foods'][0]['food'])

    return render_template('index.html', food=None)
