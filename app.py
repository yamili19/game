from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/snake')
def snake():
    return render_template('snake.html')

@app.route('/tenis')
def tenis():
    return render_template('tenis.html')

@app.route('/buscaminas')
def buscaminas():
    return render_template('buscaminas.html')

@app.route('/pinball')
def pinball():
    return render_template('pinball.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
