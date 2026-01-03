<?php

require_once(__DIR__ . '/../vendor/autoload.php');

use Appwrite\Client;
use Appwrite\Services\Databases;
use Appwrite\Services\Users;

// This Appwrite function will be executed every time your function is triggered
return function ($context) {
    // You can use the Appwrite SDK to interact with other services
    // For this example, we're using the Users service

    // IMPORTANT: Use internal Docker endpoint for container-to-container communication
    // The APPWRITE_FUNCTION_API_ENDPOINT is set to localhost which doesn't work in Docker
    $endpoint = 'http://appwrite/v1';

    // Get API key from environment - functions need an API key to access services
    $apiKey = getenv('APPWRITE_API_KEY') ?: getenv('APPWRITE_FUNCTION_API_KEY');

    $context->log('Using endpoint: ' . $endpoint);
    $context->log('API Key present: ' . ($apiKey ? 'yes (length: ' . strlen($apiKey) . ')' : 'no'));

    $client = new Client();
    $client
        ->setEndpoint($endpoint)
        ->setProject(getenv('APPWRITE_FUNCTION_PROJECT_ID'))
        ->setKey($apiKey);

    $databases = new Databases($client);

    // Insert data into the user_token collection
    try {
        $document = $databases->createDocument(
            databaseId: '6939e81e00122e88459e',
            collectionId: 'user_tokens',
            documentId: 'unique()',
            data: [
                'refresh_token' => 'hello world'
            ]
        );

        $context->log('Document created successfully: ' . $document['$id']);

        return $context->res->json([
            'success' => true,
            'message' => 'Data inserted successfully!',
            'documentId' => $document['$id']
        ]);
    } catch (\Exception $e) {
        $context->error('Failed to create document: ' . $e->getMessage());
        return $context->res->json([
            'success' => false,
            'error' => 'Failed to insert data',
            'message' => $e->getMessage()
        ], 500);
    }
};
