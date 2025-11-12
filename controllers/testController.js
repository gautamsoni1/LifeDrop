const testController = (req,res) => {
       res.status(200).send({
        message: "Welcome my page ",
        success: true,
       });

};

module.exports = { testController };