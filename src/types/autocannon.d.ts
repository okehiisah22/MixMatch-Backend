declare module 'autocannon' {
  export interface AutocannonResult {
    statusCodeStats: Record<number, number>;
    latency: Record<string, number>;
    requests: { average: number; mean: number; stddev: number; min: number; max: number; total: number };
    throughput: { average: number; mean: number; stddev: number; min: number; max: number; total: number };
    errors: number;
    timeouts: number;
    duration: number;
    start: Date;
    finish: Date;
    connections: number;
    pipelining: number;
    non2xx: number;
    [key: string]: any;
  }

  export interface AutocannonOptions {
    url: string;
    connections?: number;
    duration?: number;
    amount?: number;
    timeout?: number;
    pipelining?: number;
    workers?: number;
    method?: string;
    body?: string | Buffer;
    headers?: Record<string, string | (() => string)>;
    requests?: Array<{
      method?: string;
      path?: string;
      body?: string | Buffer;
      headers?: Record<string, string | (() => string)>;
    }>;
    [key: string]: any;
  }

  function autocannon(opts: AutocannonOptions, cb?: (err: Error | null, result: AutocannonResult) => void): Promise<AutocannonResult>;
  
  namespace autocannon {
    function printResult(result: AutocannonResult): string;
  }

  export default autocannon;
} 