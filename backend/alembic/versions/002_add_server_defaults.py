from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column("computer_builds", "inspection_status", server_default=sa.text("'pending'"))
    op.alter_column("computer_builds", "created_at", server_default=sa.text("now()"))
    op.alter_column("computer_builds", "updated_at", server_default=sa.text("now()"))

    op.alter_column("defects", "status", server_default=sa.text("'open'"))
    op.alter_column("defects", "created_at", server_default=sa.text("now()"))


def downgrade() -> None:
    op.alter_column("defects", "created_at", server_default=None)
    op.alter_column("defects", "status", server_default=None)

    op.alter_column("computer_builds", "updated_at", server_default=None)
    op.alter_column("computer_builds", "created_at", server_default=None)
    op.alter_column("computer_builds", "inspection_status", server_default=None)