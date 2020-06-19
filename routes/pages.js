module.exports = (app) => {
    app.get("/", (req, res)=>{
        res.send("Billetera");
    });

    app.get("*", (req, res)=>{
        res.send("Página no encontrada.");
    });
}
