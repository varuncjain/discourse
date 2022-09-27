# frozen_string_literal: true

class AddTutorialToUserOption < ActiveRecord::Migration[7.0]
  def change
    add_column :user_options, :skip_first_notification, :boolean, default: false
    add_column :user_options, :skip_post_menu, :boolean, default: false
    add_column :user_options, :skip_topic_timeline, :boolean, default: false
    add_column :user_options, :skip_user_card, :boolean, default: false
  end
end
