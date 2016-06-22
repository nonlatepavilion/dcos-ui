/* eslint-disable no-unused-vars */
import React from 'react';
/* eslint-enable no-unused-vars */
import Util from './Util';

const TaskUtil = {

  getTaskStatusSlug(task) {
    return task.state.substring('TASK_'.length).toLowerCase();
  },

  getTaskStatusClassName(task) {
    let taskStatus = TaskUtil.getTaskStatusSlug(task);
    return `task-status-${taskStatus}`;
  },

  getTaskStatusIcon(task) {
    let taskStatus = TaskUtil.getTaskStatusSlug(task);
    let iconClassName = `icon icon-sprite icon-sprite-mini icon-${taskStatus}`;

    // 'staging', 'finished', and 'starting' all use their monochromatic colors.
    if (taskStatus !== 'staging' && taskStatus !== 'finished' &&
      taskStatus !== 'starting') {
      iconClassName += ' icon-sprite-mini-color';
    }

    return (
      <i className={iconClassName}></i>
    );
  },

  getPortMappings(task) {
    let container = task.container;
    if (!container || !container.type) {
      return null;
    }

    let portMappings = Util.findNestedPropertyInObject(
      container,
      `${container.type.toLowerCase()}.port_mappings`
    );

    if (!Array.isArray(portMappings)) {
      return null;
    }

    return portMappings;
  }

};

module.exports = TaskUtil;
