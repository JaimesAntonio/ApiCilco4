from flask import Flask, request
# creamos objeto Flask
app = Flask(__name__)

# creamos el primer servicio web
@app.route("/", methods=["GET"])
def test():
    return "Hola esta prueba esta buena"

if __name__ == "__main__":
    app.run()



@app.route('/saludar/<string:name>', methods=['GET'])
def saludar(name: str):
    return "hola " + name
 
#Ejecutamos el servidor
if __name__ == '__main__':
    app.run()




