package com.visiplus.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
@SpringBootApplication
public class BackendApplication {

	@RequestMapping("/")
	public String home() {
		return "Hello World!";
	}
	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

}
