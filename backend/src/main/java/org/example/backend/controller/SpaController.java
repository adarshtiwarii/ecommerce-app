package org.example.backend.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    @GetMapping({
            "/product/{path:[^\\.]*}",
            "/category/{path:[^\\.]*}",
            "/search",
            "/login",
            "/register",
            "/cart",
            "/wishlist",
            "/checkout",
            "/orders",
            "/profile",
            "/admin",
            "/add-product",
            "/edit-product/{path:[^\\.]*}"
    })
    public String forwardReactRoutes() {
        return "forward:/index.html";
    }
}
