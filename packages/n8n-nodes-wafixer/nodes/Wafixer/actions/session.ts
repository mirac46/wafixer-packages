import { NodeOperationError, type IDataObject, type IExecuteFunctions } from 'n8n-workflow'
import type { Wafixer } from 'wafixer-sdk'

/** Oturum listesinde `instance` alanı gizlidir; diğer işlemler seçili oturumla çalışır. */
export const SESSION_OPERATIONS_WITHOUT_INSTANCE = ['listSessions']

export async function executeSessionOperation(
  ctx: IExecuteFunctions,
  wa: Wafixer,
  instance: string,
  operation: string,
  i: number,
): Promise<IDataObject[]> {
  switch (operation) {
    case 'listSessions': {
      const sessions = await wa.instances.list()
      return Array.isArray(sessions) ? sessions.map((session) => ({ ...session })) : []
    }
    case 'getConnectionState': {
      const { instance: state, ...rest } = await wa.instances.connectionState(instance)
      return [{ ...state, ...rest }]
    }
    case 'restart':
      return [((await wa.instances.restart(instance)) ?? {}) as IDataObject]
    default:
      throw new NodeOperationError(ctx.getNode(), `Unknown session operation: ${operation}`, { itemIndex: i })
  }
}
