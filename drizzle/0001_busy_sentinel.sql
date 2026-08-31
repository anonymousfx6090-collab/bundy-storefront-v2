CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(120) NOT NULL,
	`title` varchar(180) NOT NULL,
	`description` text NOT NULL,
	`price` double NOT NULL,
	`currency` varchar(8) NOT NULL DEFAULT 'NGN',
	`category` varchar(80) NOT NULL,
	`imageUrl` text NOT NULL,
	`imageAlt` varchar(240) NOT NULL,
	`temuUrl` text NOT NULL,
	`status` enum('active','sold-out','inactive') NOT NULL DEFAULT 'active',
	`isPublished` boolean NOT NULL DEFAULT false,
	`isFeatured` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
