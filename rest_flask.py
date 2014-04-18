#!flask/bin/python

from flask import Flask
import subprocess

app = Flask(__name__)

@app.route('/')
def index():
	return "Hello, World!"

@app.route('/cpu')
def get_cpu():
	output = subprocess.Popen(["cat", "/proc/cpuinfo"], stdout=subprocess.PIPE)
	return "".join(output.stdout.readlines())

@app.route('/mem')
def get_mem():
	output = subprocess.Popen("free", shell=True, stdout=subprocess.PIPE)
	return "".join(output.stdout.readlines())

@app.route('/disk')
def get_disk():
	output = subprocess.Popen("df -h", shell=True, stdout=subprocess.PIPE)
	return "".join(output.stdout.readlines())

if __name__ == '__main__':
	app.run(debug=True)
