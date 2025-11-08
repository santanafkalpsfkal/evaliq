// Reusable component to show a standardized "feature not yet available" alert/trigger
import React from 'react';
import { Alert, Button, Space, notification } from 'antd';
import { HourglassOutlined } from '@ant-design/icons';

/**
 * FeatureDisabledAlert
 * Props:
 *  - feature (string): human readable feature name
 *  - description (string, optional): extra details
 *  - inline (boolean): if true, render compact inline variant
 *  - buttonText (string): custom call to action label
 */
export const FeatureDisabledAlert = ({
  feature = 'Esta función',
  description = 'Aún no está habilitada. Estará disponible en próximas versiones.',
  inline = false,
  buttonText = 'Más info'
}) => {
  const fireNotification = () => {
    notification.info({
      message: `${feature} próximamente`,
      description,
      placement: 'topRight'
    });
  };

  if (inline) {
    return (
      <Space>
        <Button size="small" type="dashed" onClick={fireNotification} icon={<HourglassOutlined />}> {feature} </Button>
      </Space>
    );
  }

  return (
    <Alert
      type="info"
      showIcon
      message={`${feature} próximamente`}
      description={
        <Space direction="vertical" style={{ width: '100%' }}>
          <span>{description}</span>
          <div>
            <Button size="small" onClick={fireNotification} icon={<HourglassOutlined />}>{buttonText}</Button>
          </div>
        </Space>
      }
    />
  );
};

export default FeatureDisabledAlert;
