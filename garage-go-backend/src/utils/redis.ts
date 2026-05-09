import { createClient, RedisClientType } from 'redis';

class Redis {
  private static instance: RedisClientType;

  public static getInstance(): RedisClientType {
    if (!Redis.instance) {
      Redis.instance = createClient({
        url: process.env.REDIS_URL || 'redis://localhost:6379',
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.error('Redis reconnection failed after 10 attempts');
              return false;
            }
            return Math.min(retries * 50, 1000);
          },
        },
      });

      Redis.instance.on('error', (error) => {
        console.error('Redis Client Error:', error);
      });

      Redis.instance.on('connect', () => {
        console.log('✅ Redis connected successfully');
      });

      Redis.instance.on('disconnect', () => {
        console.log('❌ Redis disconnected');
      });
    }
    return Redis.instance;
  }

  public static async connect(): Promise<void> {
    try {
      const client = Redis.getInstance();
      await client.connect();
    } catch (error) {
      console.error('❌ Redis connection failed:', error);
      // Don't exit process for Redis, as it's not critical for basic functionality
    }
  }

  public static async disconnect(): Promise<void> {
    try {
      const client = Redis.getInstance();
      if (client.isOpen) {
        await client.disconnect();
        console.log('✅ Redis disconnected successfully');
      }
    } catch (error) {
      console.error('❌ Redis disconnection failed:', error);
    }
  }

  public static async healthCheck(): Promise<boolean> {
    try {
      const client = Redis.getInstance();
      if (!client.isOpen) {
        return false;
      }
      await client.ping();
      return true;
    } catch (error) {
      console.error('Redis health check failed:', error);
      return false;
    }
  }

  // Cache utilities
  public static async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const client = Redis.getInstance();
      const serializedValue = JSON.stringify(value);
      
      if (ttl) {
        await client.setEx(key, ttl, serializedValue);
      } else {
        await client.set(key, serializedValue);
      }
    } catch (error) {
      console.error('Redis SET error:', error);
    }
  }

  public static async get<T>(key: string): Promise<T | null> {
    try {
      const client = Redis.getInstance();
      const value = await client.get(key);
      
      if (value === null) {
        return null;
      }
      
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  public static async del(key: string): Promise<void> {
    try {
      const client = Redis.getInstance();
      await client.del(key);
    } catch (error) {
      console.error('Redis DEL error:', error);
    }
  }

  public static async exists(key: string): Promise<boolean> {
    try {
      const client = Redis.getInstance();
      const result = await client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  }

  // Queue utilities
  public static async pushToList(listName: string, value: any): Promise<void> {
    try {
      const client = Redis.getInstance();
      const serializedValue = JSON.stringify(value);
      await client.lPush(listName, serializedValue);
    } catch (error) {
      console.error('Redis LPUSH error:', error);
    }
  }

  public static async popFromList(listName: string): Promise<any | null> {
    try {
      const client = Redis.getInstance();
      const value = await client.rPop(listName);
      
      if (value === null) {
        return null;
      }
      
      return JSON.parse(value);
    } catch (error) {
      console.error('Redis RPOP error:', error);
      return null;
    }
  }

  public static async getListLength(listName: string): Promise<number> {
    try {
      const client = Redis.getInstance();
      return await client.lLen(listName);
    } catch (error) {
      console.error('Redis LLEN error:', error);
      return 0;
    }
  }

  // Session utilities
  public static async setSession(sessionId: string, sessionData: any, ttl: number = 86400): Promise<void> {
    const key = `session:${sessionId}`;
    await Redis.set(key, sessionData, ttl);
  }

  public static async getSession(sessionId: string): Promise<any | null> {
    const key = `session:${sessionId}`;
    return await Redis.get(key);
  }

  public static async deleteSession(sessionId: string): Promise<void> {
    const key = `session:${sessionId}`;
    await Redis.del(key);
  }

  // Rate limiting utilities
  public static async incrementRateLimit(identifier: string, window: number): Promise<number> {
    try {
      const client = Redis.getInstance();
      const key = `rate_limit:${identifier}`;
      const current = await client.incr(key);
      
      if (current === 1) {
        await client.expire(key, window);
      }
      
      return current;
    } catch (error) {
      console.error('Redis rate limit error:', error);
      return 0;
    }
  }

  // Cache invalidation utilities
  public static async invalidatePattern(pattern: string): Promise<void> {
    try {
      const client = Redis.getInstance();
      const keys = await client.keys(pattern);
      
      if (keys.length > 0) {
        await client.del(keys);
      }
    } catch (error) {
      console.error('Redis pattern deletion error:', error);
    }
  }
}

export { Redis };
