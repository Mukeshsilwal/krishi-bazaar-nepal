import { resolveErrorMessage } from '@krishihub/common-utils';

export function resolveUserMessage(error: any): string {
    return resolveErrorMessage(error);
}
