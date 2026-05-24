import { notification } from 'antd'

export const notifySuccess = (message, description) =>
  notification.success({ message, description, placement: 'topRight' })

export const notifyError = (message, description) =>
  notification.error({ message, description, placement: 'topRight' })

export const notifyInfo = (message, description) =>
  notification.info({ message, description, placement: 'topRight' })
