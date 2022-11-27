import {ClassConstructor, instanceToPlain, plainToInstance} from "class-transformer";
import {logger} from "../Logger";
import * as fs from "fs";

export default class Adapter<T> {
    private readonly cls: ClassConstructor<T>;
    private readonly path: string;

    constructor(cls: ClassConstructor<T>, path: string) {
        this.cls = cls;
        this.path = path
    }

    write(data: T|T[]): void {
        const content = JSON.stringify(instanceToPlain(data));
        fs.writeFileSync(this.path, content, 'utf8');
    }

    read(): null|T|T[] {
        if (!fs.existsSync(this.path)) {
            return null
        }

        try {
            const data = JSON.parse(fs.readFileSync(this.path, 'utf8'));
            return plainToInstance(this.cls, data);
        } catch(e) {
            logger.error('Storage (%s) : read error - %s', this.cls.name, e.message)
            return null;
        }
    }

    delete(): void
    {
        if (fs.existsSync(this.path)) {
            fs.unlinkSync(this.path)
        }
    }
}