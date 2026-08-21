package com.smartpark;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class SmartparkApplication {

	public static void main(String[] args) {
		SpringApplication.run(SmartparkApplication.class, args);
	}

}
