package com.prabhatech.videoanalytics.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadDir + "/");
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Serve the React SPA's index.html for any client-side route so deep
        // links / refreshes work, without shadowing the API, websocket,
        // Swagger, or static asset endpoints (all single-segment routes in
        // this app, so no /** needed - that would shadow /assets/**).
        registry.addViewController("/{path:^(?!api|ws|uploads|swagger-ui|v3|assets)[^\\.]*}")
                .setViewName("forward:/index.html");
    }
}
