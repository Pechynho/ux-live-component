<<<<<<< HEAD
=======
export interface Download {
    filename: string;
    blob: Blob;
}

/**
 * A response may carry a file after the HTML, in the same body.
 *
 * `X-Live-Html-Length` gives the byte offset where the HTML ends and the file
 * begins, so the two are split without any delimiter to scan for.
 */
>>>>>>> upstream/3.x
export default class {
    response: Response;
    private body: string;
    private liveUrl: string | null;
<<<<<<< HEAD
=======
    private download: Download | null = null;
    private parsePromise: Promise<void> | null = null;
>>>>>>> upstream/3.x

    constructor(response: Response) {
        this.response = response;
    }

    async getBody(): Promise<string> {
<<<<<<< HEAD
        if (!this.body) {
            this.body = await this.response.text();
        }
=======
        if (!this.parsePromise) {
            this.parsePromise = this.parse();
        }
        await this.parsePromise;
>>>>>>> upstream/3.x

        return this.body;
    }

<<<<<<< HEAD
=======
    /**
     * Synchronous on purpose, so the download can be triggered from the render path.
     * Only meaningful once getBody() has resolved.
     */
    getDownload(): Download | null {
        return this.download;
    }

>>>>>>> upstream/3.x
    getLiveUrl(): string | null {
        if (undefined === this.liveUrl) {
            this.liveUrl = this.response.headers.get('X-Live-Url');
        }

        return this.liveUrl;
    }
<<<<<<< HEAD
=======

    /**
     * A URL the browser downloads itself, rather than a file carried in this response.
     */
    getDownloadUrl(): string | null {
        return this.response.headers.get('X-Live-Download-Url');
    }

    /**
     * Whether the component is meant to leave the page after its final re-render.
     */
    isRemoved(): boolean {
        return this.response.headers.has('X-Live-Remove');
    }

    private async parse(): Promise<void> {
        const htmlLength = this.response.headers.get('X-Live-Html-Length');

        if (null === htmlLength) {
            this.body = await this.response.text();

            return;
        }

        // the file may hold bytes that are not valid UTF-8, so the body is split
        // as bytes and only the HTML side is decoded
        const buffer = await this.response.arrayBuffer();
        const splitAt = Number.parseInt(htmlLength, 10);

        this.body = new TextDecoder().decode(buffer.slice(0, splitAt));
        this.download = {
            // the filename is percent-encoded: headers carry ASCII only
            filename: decodeFilename(this.response.headers.get('X-Live-Download-Filename')),
            blob: new Blob([buffer.slice(splitAt)], {
                type: this.response.headers.get('X-Live-Download-Type') ?? 'application/octet-stream',
            }),
        };
    }
}

function decodeFilename(value: string | null): string {
    if (!value) {
        return 'download';
    }

    try {
        return decodeURIComponent(value) || 'download';
    } catch {
        // malformed percent-encoding: better a generic name than a failed download
        return 'download';
    }
>>>>>>> upstream/3.x
}
