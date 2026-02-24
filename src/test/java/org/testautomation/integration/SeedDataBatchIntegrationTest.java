package org.testautomation.integration;

import org.junit.jupiter.api.Test;
import org.springframework.batch.core.BatchStatus;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.testautomation.repository.CategoryRepository;
import org.testautomation.repository.ProductRepository;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest(properties = {
        "seed.enabled=true",
        "seed.count=7",
        "spring.batch.job.enabled=false"
})
@ActiveProfiles("test")
class SeedDataBatchIntegrationTest {

    @Autowired
    private JobLauncher jobLauncher;

    @Autowired
    @Qualifier("seedDataJob")
    private Job seedDataJob;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ProductRepository productRepository;

    @Test
    void seedDataJobSeedsOnceAndSkipsWhenDataAlreadyExists() throws Exception {
        categoryRepository.deleteAll();
        productRepository.deleteAll();

        JobExecution firstExecution = jobLauncher.run(
                seedDataJob,
                new JobParametersBuilder()
                        .addLong("ts", System.currentTimeMillis())
                        .toJobParameters()
        );

        assertEquals(BatchStatus.COMPLETED, firstExecution.getStatus());
        assertEquals(10, categoryRepository.count());
        assertEquals(7, productRepository.count());

        JobExecution secondExecution = jobLauncher.run(
                seedDataJob,
                new JobParametersBuilder()
                        .addLong("ts", System.currentTimeMillis() + 1)
                        .toJobParameters()
        );

        assertEquals(BatchStatus.COMPLETED, secondExecution.getStatus());
        assertEquals(10, categoryRepository.count());
        assertEquals(7, productRepository.count());
    }
}
