// src/utils/formatUtils.js

/**
 * Convert bytes to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export function readableBytes(bytes) {
  if (!bytes || bytes === 0) return "0 B";
  
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Get status color based on video status
 * @param {string} status - Video status
 * @returns {string} CSS color value
 */
export function getStatusColor(status) {
  switch (status) {
    case 'ready':
    case 'completed':
      return '#10b981'; // Green
    case 'processing':
    case 'uploading':
      return '#f59e0b'; // Amber/Yellow
    case 'flagged':
    case 'failed':
    case 'error':
      return '#ef4444'; // Red
    case 'queued':
    case 'pending':
      return '#6b7280'; // Gray
    default:
      return '#64748b'; // Slate
  }
}

/**
 * Format date to readable string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  if (!date) return 'Unknown';
  
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Get file extension from filename
 * @param {string} filename - File name
 * @returns {string} File extension
 */
export function getFileExtension(filename) {
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
}

/**
 * Get video duration (mock function - you'd implement actual duration detection)
 * @param {Object} video - Video object
 * @returns {string} Formatted duration
 */

/**
 * Format upload progress message
 * @param {number} progress - Upload progress percentage
 * @param {string} stage - Processing stage
 * @returns {string} Formatted progress message
 */
export function getProgressMessage(progress, stage) {
  if (stage === 'uploading') {
    return `Uploading... ${progress}%`;
  } else if (stage === 'processing') {
    return `Processing... ${progress}%`;
  } else if (stage === 'ready') {
    return 'Ready to play';
  } else {
    return `${stage}... ${progress}%`;
  }
}