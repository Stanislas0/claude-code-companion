// Inspector UI Messages - Message rendering functionality
InspectorUI.prototype.renderMessages = function(messages) {
    let messagesHtml = `
        <div class="inspector-section">
            <div class="inspector-title-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <h6 class="inspector-title" style="margin-bottom: 0;">💬 对话消息</h6>
                <button class="inspector-btn btn btn-sm" onclick="window.inspectorToggleMessageOrder()" id="message-order-toggle" data-reversed="false" style="padding: 4px 12px; font-size: 12px;">
                    <span id="message-order-icon">↑</span>
                    <span id="message-order-text">正向排列</span>
                </button>
            </div>
            <div id="messages-container">
    `;

    messages.forEach(message => {
        messagesHtml += this.renderMessage(message);
    });

    messagesHtml += '</div></div>';
    this.container.appendChild(this.createElementFromHTML(messagesHtml));
};

InspectorUI.prototype.renderMessage = function(message) {
    const roleIcon = message.role === 'user' ? '👤' : '🤖';
    const roleClass = `inspector-message-${message.role}`;
    
    let messageHtml = `
        <div class="inspector-message ${roleClass}">
            <div class="inspector-message-header">
                [${message.index}] ${roleIcon} ${message.role.charAt(0).toUpperCase() + message.role.slice(1)}
            </div>
            <div class="inspector-message-content">
    `;

    // 渲染文本内容
    message.content.forEach((content, idx) => {
        if (content.type === 'text') {
            const contentId = `message-${message.index}-content-${idx}`;
            messageHtml += `
                <div class="inspector-content-item">
                    <div class="inspector-collapse-header" onclick="window.inspectorToggleCollapse('${contentId}')">
                        <span class="inspector-collapse-icon" id="${contentId}-icon">▶</span>
                        💭 正文内容 (${content.text.length} 字符)
                    </div>
                    <div class="inspector-collapse-content" id="${contentId}" style="display: none;">
                        <div class="inspector-content-box">
                            <pre class="inspector-text">${this.escapeHtml(content.text)}</pre>
                        </div>
                    </div>
                    <div class="inspector-preview">${this.escapeHtml(content.preview)}</div>
                </div>
            `;
        }
    });

    // 渲染 System Reminders
    if (message.systemReminders.length > 0) {
        const remindersId = `message-${message.index}-reminders`;
        messageHtml += `
            <div class="inspector-content-item">
                <div class="inspector-collapse-header" onclick="window.inspectorToggleCollapse('${remindersId}')">
                    <span class="inspector-collapse-icon" id="${remindersId}-icon">▶</span>
                    ⚠️ System Reminders (${message.systemReminders.length}个)
                </div>
                <div class="inspector-collapse-content" id="${remindersId}" style="display: none;">
                    ${this.renderSystemReminders(message.systemReminders, message.index)}
                </div>
            </div>
        `;
    }

    // 渲染工具调用 - assistant 显示 tool_use，user 显示 tool_result
    if (message.role === 'assistant' && message.toolUses && message.toolUses.length > 0) {
        // 只显示 tool_use，不显示结果
        const toolUses = message.toolUses.filter(tool => tool.type === 'use');
        if (toolUses.length > 0) {
            const toolCallsId = `message-${message.index}-tools`;
            messageHtml += `
                <div class="inspector-content-item">
                    <div class="inspector-collapse-header" onclick="window.inspectorToggleCollapse('${toolCallsId}')">
                        <span class="inspector-collapse-icon" id="${toolCallsId}-icon">▼</span>
                        🔧 工具调用 (${toolUses.length}次)
                    </div>
                    <div class="inspector-collapse-content" id="${toolCallsId}" style="display: block;">
                        ${this.renderAssistantToolUses(toolUses, message.index)}
                    </div>
                </div>
            `;
        }
    } else if (message.role === 'user' && message.toolUses && message.toolUses.length > 0) {
        // 用户消息显示工具结果
        const toolResults = message.toolUses.filter(tool => tool.type === 'result');
        if (toolResults.length > 0) {
            const userToolsId = `message-${message.index}-user-tools`;
            messageHtml += `
                <div class="inspector-content-item">
                    <div class="inspector-collapse-header" onclick="window.inspectorToggleCollapse('${userToolsId}')">
                        <span class="inspector-collapse-icon" id="${userToolsId}-icon">▼</span>
                        🔧 工具结果 (${toolResults.length}个)
                    </div>
                    <div class="inspector-collapse-content" id="${userToolsId}" style="display: block;">
                        ${this.renderUserToolResults(toolResults, message.index)}
                    </div>
                </div>
            `;
        }
    }

    messageHtml += '</div></div>';
    return messageHtml;
};