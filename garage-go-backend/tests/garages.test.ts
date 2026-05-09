import request from 'supertest';
import app from '@/app';
import { prisma } from './setup';

describe('Garages', () => {
  let ownerToken: string;
  let adminToken: string;
  let testGarage: any;

  beforeEach(async () => {
    // Create owner user
    const ownerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'owner@example.com',
        password: 'Test123!@#',
        fullName: 'Garage Owner',
        role: 'OWNER',
      });

    ownerToken = ownerResponse.body.data.token;

    // Create admin user
    const adminResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'admin@example.com',
        password: 'Test123!@#',
        fullName: 'Admin User',
        role: 'ADMIN',
      });

    adminToken = adminResponse.body.data.token;
  });

  describe('POST /api/v1/garages', () => {
    it('should create a garage successfully', async () => {
      const garageData = {
        name: 'Test Garage',
        description: 'A test garage',
        address: '123 Test St',
        phone: '+1234567890',
        email: 'test@garage.com',
      };

      const response = await request(app)
        .post('/api/v1/garages')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(garageData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(garageData.name);
      expect(response.body.data.ownerId).toBeDefined();
      testGarage = response.body.data;
    });

    it('should return error for unauthorized access', async () => {
      const garageData = {
        name: 'Test Garage',
        description: 'A test garage',
      };

      const response = await request(app)
        .post('/api/v1/garages')
        .send(garageData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should return error for invalid data', async () => {
      const garageData = {
        name: '', // Empty name
        description: 'A test garage',
      };

      const response = await request(app)
        .post('/api/v1/garages')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(garageData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/garages', () => {
    beforeEach(async () => {
      // Create a test garage
      const garageResponse = await request(app)
        .post('/api/v1/garages')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          name: 'Test Garage',
          description: 'A test garage',
          address: '123 Test St',
        });
      testGarage = garageResponse.body.data;
    });

    it('should list all active garages', async () => {
      const response = await request(app)
        .get('/api/v1/garages')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should filter garages by search term', async () => {
      const response = await request(app)
        .get('/api/v1/garages?search=Test')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/v1/garages?page=1&limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(5);
    });
  });

  describe('GET /api/v1/garages/:id', () => {
    beforeEach(async () => {
      const garageResponse = await request(app)
        .post('/api/v1/garages')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          name: 'Test Garage',
          description: 'A test garage',
          address: '123 Test St',
        });
      testGarage = garageResponse.body.data;
    });

    it('should get garage by ID', async () => {
      const response = await request(app)
        .get(`/api/v1/garages/${testGarage.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testGarage.id);
      expect(response.body.data.name).toBe(testGarage.name);
    });

    it('should return error for non-existent garage', async () => {
      const response = await request(app)
        .get('/api/v1/garages/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/v1/garages/:id', () => {
    beforeEach(async () => {
      const garageResponse = await request(app)
        .post('/api/v1/garages')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          name: 'Test Garage',
          description: 'A test garage',
          address: '123 Test St',
        });
      testGarage = garageResponse.body.data;
    });

    it('should update garage successfully', async () => {
      const updateData = {
        name: 'Updated Garage Name',
        description: 'Updated description',
      };

      const response = await request(app)
        .put(`/api/v1/garages/${testGarage.id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.data.description).toBe(updateData.description);
    });

    it('should allow admin to update any garage', async () => {
      const updateData = {
        name: 'Admin Updated Garage',
      };

      const response = await request(app)
        .put(`/api/v1/garages/${testGarage.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
    });

    it('should return error for unauthorized update', async () => {
      // Create another user
      const userResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'user@example.com',
          password: 'Test123!@#',
          fullName: 'Regular User',
        });

      const userToken = userResponse.body.data.token;

      const updateData = {
        name: 'Unauthorized Update',
      };

      const response = await request(app)
        .put(`/api/v1/garages/${testGarage.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/v1/garages/:id', () => {
    beforeEach(async () => {
      const garageResponse = await request(app)
        .post('/api/v1/garages')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          name: 'Test Garage',
          description: 'A test garage',
          address: '123 Test St',
        });
      testGarage = garageResponse.body.data;
    });

    it('should delete garage successfully', async () => {
      const response = await request(app)
        .delete(`/api/v1/garages/${testGarage.id}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should allow admin to delete any garage', async () => {
      const response = await request(app)
        .delete(`/api/v1/garages/${testGarage.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return error for unauthorized deletion', async () => {
      const userResponse = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'user@example.com',
          password: 'Test123!@#',
          fullName: 'Regular User',
        });

      const userToken = userResponse.body.data.token;

      const response = await request(app)
        .delete(`/api/v1/garages/${testGarage.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});
