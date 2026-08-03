import { Public } from "@micro-service/nest-auth";
import { Controller, Get, Header } from "@nestjs/common";
import { MetricsRegistry } from "./metrics.registry";

@Public()
@Controller('metrics')
export class MetricsController {
    constructor(private readonly metrics: MetricsRegistry) {}

    @Get()
    @Header('Content-Type', 'text/plain')
    async scrape() {
        return this.metrics.registry.metrics();
    }
}