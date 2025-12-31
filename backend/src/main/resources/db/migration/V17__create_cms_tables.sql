-- Create Content Workflow History Table
CREATE TABLE content_workflow_history (
    id UUID PRIMARY KEY,
    content_type VARCHAR(50) NOT NULL,
    content_id UUID NOT NULL,
    actor_id UUID,
    action VARCHAR(50) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Article Versions Table
CREATE TABLE article_versions (
    id UUID PRIMARY KEY,
    article_id UUID NOT NULL,
    version_number INT NOT NULL,
    content_snapshot JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    CONSTRAINT fk_article_version FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

-- Index for performance
CREATE INDEX idx_workflow_content_id ON content_workflow_history(content_id);
CREATE INDEX idx_article_version_article_id ON article_versions(article_id);
