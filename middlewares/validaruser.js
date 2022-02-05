function validarNoAutenticado(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}

function validarAutenticado(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

module.exports = {
  validarNoAutenticado,
  validarAutenticado,
};
