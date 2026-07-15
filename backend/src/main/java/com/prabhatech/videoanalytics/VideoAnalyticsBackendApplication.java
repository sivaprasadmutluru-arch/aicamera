package com.prabhatech.videoanalytics;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableJpaAuditing
@EnableAsync
@EnableScheduling
public class VideoAnalyticsBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(VideoAnalyticsBackendApplication.class, args);
	}

}
