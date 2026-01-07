export default function ensureAdmin(req, res, next) {
    // expose admin flag to templates
    res.locals.admin = !!(req.session && req.session.isAdmin);
    if (res.locals.admin) {
        return next();
    }
    return res.redirect('/admin/login');
}