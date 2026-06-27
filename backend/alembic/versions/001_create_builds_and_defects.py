from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "computer_builds",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("serial_number", sa.String(length=100), nullable=False),
        sa.Column("asset_tag", sa.String(length=100), nullable=True),
        sa.Column("manufacturer", sa.String(length=255), nullable=False),
        sa.Column("model_name", sa.String(length=255), nullable=False),
        sa.Column("cpu", sa.String(length=255), nullable=False),
        sa.Column("gpu", sa.String(length=255), nullable=False),
        sa.Column("ram_gb", sa.Integer(), nullable=False),
        sa.Column("storage_gb", sa.Integer(), nullable=False),
        sa.Column("operating_system", sa.String(length=255), nullable=True),
        sa.Column(
            "inspection_status",
            sa.Enum("pending", "passed", "failed", "rework", name="inspectionstatus", native_enum=False),
            nullable=False,
        ),
        sa.Column("inspector_name", sa.String(length=255), nullable=False),
        sa.Column("notes", sa.String(length=2000), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_computer_builds_id"), "computer_builds", ["id"], unique=False)
    op.create_index(op.f("ix_computer_builds_serial_number"), "computer_builds", ["serial_number"], unique=True)

    op.create_table(
        "defects",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("build_id", sa.Uuid(), nullable=False),
        sa.Column(
            "defect_category",
            sa.Enum("wiring", "gpu", "cpu", "memory", "storage", "cooling", "cosmetic", "software", "other", name="defectcategory", native_enum=False),
            nullable=False,
        ),
        sa.Column(
            "severity",
            sa.Enum("low", "medium", "high", "critical", name="defectseverity", native_enum=False),
            nullable=False,
        ),
        sa.Column("description", sa.String(length=2000), nullable=False),
        sa.Column("resolution_notes", sa.String(length=2000), nullable=True),
        sa.Column(
            "status",
            sa.Enum("open", "in_rework", "resolved", name="defectstatus", native_enum=False),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["build_id"], ["computer_builds.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_defects_id"), "defects", ["id"], unique=False)
    op.create_index(op.f("ix_defects_build_id"), "defects", ["build_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_defects_build_id"), table_name="defects")
    op.drop_index(op.f("ix_defects_id"), table_name="defects")
    op.drop_table("defects")
    op.drop_index(op.f("ix_computer_builds_serial_number"), table_name="computer_builds")
    op.drop_index(op.f("ix_computer_builds_id"), table_name="computer_builds")
    op.drop_table("computer_builds")
