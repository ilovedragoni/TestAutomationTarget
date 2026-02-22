package org.testautomation.batch;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobExecution;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.StepExecution;
import org.springframework.batch.core.configuration.annotation.StepScope;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.job.flow.FlowExecutionStatus;
import org.springframework.batch.core.job.flow.JobExecutionDecider;
import org.springframework.batch.core.launch.support.RunIdIncrementer;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.core.step.tasklet.Tasklet;
import org.springframework.batch.item.ItemReader;
import org.springframework.batch.item.ItemWriter;
import org.springframework.batch.repeat.RepeatStatus;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.transaction.PlatformTransactionManager;
import org.testautomation.entity.Category;
import org.testautomation.entity.Product;
import org.testautomation.repository.CategoryRepository;
import org.testautomation.repository.ProductRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicInteger;

@Configuration
@ConditionalOnProperty(name = "seed.enabled", havingValue = "true")
public class SeedDataLoader {

    private static final Logger log = LoggerFactory.getLogger(SeedDataLoader.class);
    private static final int CHUNK_SIZE = 500;

    private static final String[] CATEGORY_NAMES = {
            "Electronics", "Home & Garden", "Sports", "Books", "Clothing",
            "Toys", "Automotive", "Health", "Office", "Tools"
    };
    private static final String[] PREFIXES = {
            "Widget", "Gadget", "Tool", "Device", "Unit", "Kit", "Set", "Pack",
            "Pro", "Basic", "Deluxe", "Standard", "Premium", "Compact", "Heavy-Duty"
    };
    private static final String[] SUFFIXES = {
            "Alpha", "Beta", "X1", "Plus", "Max", "Mini", "Lite", "Classic",
            "2024", "Pro", "Elite", "Essential", "Starter", "Advanced"
    };
    private static final String[] DESCRIPTIONS = {
            "Suitable for everyday use.",
            "High quality construction.",
            "Designed for performance.",
            "Ideal for testing scenarios.",
            "Reliable and durable.",
            "Cost-effective solution.",
            "Meets industry standards.",
            null
    };

    private static final String SEED = "SEED";
    private static final String SKIP = "SKIP";

    // ── Decider: check whether the DB already has data ──────────────────

    @Bean
    public JobExecutionDecider seedDecider(ProductRepository productRepository) {
        return (JobExecution jobExecution, StepExecution stepExecution) -> {
            if (productRepository.count() > 0) {
                log.info("Seed skipped: database already has data");
                return new FlowExecutionStatus(SKIP);
            }
            return new FlowExecutionStatus(SEED);
        };
    }

    // ── Job ─────────────────────────────────────────────────────────────

    @Bean
    public Job seedDataJob(JobRepository jobRepository,
                           JobExecutionDecider seedDecider,
                           Step seedCategoriesStep,
                           Step seedProductsStep) {
        return new JobBuilder("seedDataJob", jobRepository)
                .incrementer(new RunIdIncrementer())
                .start(seedDecider)
                .on(SKIP).end()
                .on(SEED).to(seedCategoriesStep)
                .from(seedCategoriesStep)
                .next(seedProductsStep)
                .end()
                .build();
    }

    // ── Step 1 – Categories (Tasklet) ───────────────────────────────────

    @Bean
    public Step seedCategoriesStep(JobRepository jobRepository,
                                   PlatformTransactionManager tx,
                                   CategoryRepository categoryRepository) {
        Tasklet tasklet = (contribution, chunkContext) -> {
            if (categoryRepository.count() > 0) {
                log.info("Categories already present – skipping");
                return RepeatStatus.FINISHED;
            }
            log.info("Seeding categories...");
            for (String name : CATEGORY_NAMES) {
                categoryRepository.save(new Category(name, "Category: " + name));
            }
            log.info("Seeded {} categories", CATEGORY_NAMES.length);
            return RepeatStatus.FINISHED;
        };

        return new StepBuilder("seedCategoriesStep", jobRepository)
                .tasklet(tasklet, tx)
                .build();
    }

    // ── Step 2 – Products (Chunk-oriented) ──────────────────────────────

    @Bean
    public Step seedProductsStep(JobRepository jobRepository,
                                 PlatformTransactionManager tx,
                                 ItemReader<Product> productItemReader,
                                 ItemWriter<Product> productItemWriter) {
        return new StepBuilder("seedProductsStep", jobRepository)
                .<Product, Product>chunk(CHUNK_SIZE, tx)
                .reader(productItemReader)
                .writer(productItemWriter)
                .build();
    }

    @Bean
    @StepScope
    public ItemReader<Product> productItemReader(CategoryRepository categoryRepository,
                                                 Environment environment) {
        int seedCount = environment.getProperty("seed.count", Integer.class, 1000);

        return new ItemReader<>() {
            private final AtomicInteger counter = new AtomicInteger(0);
            private List<Category> categories;

            @Override
            public Product read() {
                if (categories == null) {
                    categories = categoryRepository.findAll();
                    log.info("Seeding {} products for performance testing...", seedCount);
                }

                int i = counter.incrementAndGet();
                if (i > seedCount) return null;

                ThreadLocalRandom rnd = ThreadLocalRandom.current();
                String name = PREFIXES[rnd.nextInt(PREFIXES.length)] + " "
                        + SUFFIXES[rnd.nextInt(SUFFIXES.length)] + " " + i;
                String desc = DESCRIPTIONS[rnd.nextInt(DESCRIPTIONS.length)];
                BigDecimal price = BigDecimal.valueOf(rnd.nextDouble(1.0, 999.99))
                        .setScale(2, RoundingMode.HALF_UP);
                Category category = categories.get(rnd.nextInt(categories.size()));

                return new Product(name, desc, price, category);
            }
        };
    }

    @Bean
    public ItemWriter<Product> productItemWriter(ProductRepository productRepository) {
        return items -> {
            productRepository.saveAll(items.getItems());
            log.debug("Written chunk of {} products", items.size());
        };
    }
}