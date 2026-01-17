-- Create conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- DIRECT, ORDER, SUPPORT
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    last_message_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create conversation_participants table
CREATE TABLE conversation_participants (
    id UUID PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES conversations(id),
    user_id UUID NOT NULL REFERENCES users(id),
    role VARCHAR(50) DEFAULT 'MEMBER',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(conversation_id, user_id)
);

-- Modify messages table to link with conversations
ALTER TABLE messages ADD COLUMN conversation_id UUID REFERENCES conversations(id);
ALTER TABLE messages ADD COLUMN type VARCHAR(50) DEFAULT 'TEXT';
ALTER TABLE messages ADD COLUMN deleted BOOLEAN DEFAULT FALSE;

-- Create indexes for performance
CREATE INDEX idx_conversations_last_message_at ON conversations(last_message_at);
CREATE INDEX idx_conversation_participants_user_id ON conversation_participants(user_id);
CREATE INDEX idx_conversation_participants_conversation_id ON conversation_participants(conversation_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
